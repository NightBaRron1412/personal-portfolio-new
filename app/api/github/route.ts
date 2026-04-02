import { NextResponse } from "next/server";

const GITHUB_USERNAME = "NightBaRron1412";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional, for higher rate limits

async function githubFetch(url: string) {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "personal-portfolio",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return fetch(url, { headers, next: { revalidate: 300 } });
}

async function githubGraphqlFetch<TData>(
  query: string,
  variables: Record<string, unknown>
): Promise<TData | null> {
  if (!GITHUB_TOKEN) return null;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "personal-portfolio",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors) return null;
  return (json?.data as TData) ?? null;
}

function toUTCDateKey(dateInput?: string | null): string | null {
  if (!dateInput) return null;
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface CalendarQueryData {
  viewer?: {
    login?: string;
    contributionsCollection?: {
      hasAnyRestrictedContributions?: boolean;
      contributionCalendar?: {
        weeks?: ContributionWeek[];
      };
    };
  };
}

async function getViewerContributionMap(from: string, to: string) {
  const query = `
    query ViewerContributions($from: DateTime!, $to: DateTime!) {
      viewer {
        login
        contributionsCollection(from: $from, to: $to) {
          hasAnyRestrictedContributions
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphqlFetch<CalendarQueryData>(query, { from, to });
  const viewer = data?.viewer;
  if (!viewer?.login || viewer.login.toLowerCase() !== GITHUB_USERNAME.toLowerCase()) {
    return null;
  }

  const weeks = viewer.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const map: Record<string, number> = {};
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      const key = toUTCDateKey(day.date);
      if (!key) continue;
      map[key] = day.contributionCount ?? 0;
    }
  }

  return {
    map,
    hasRestricted: Boolean(viewer.contributionsCollection?.hasAnyRestrictedContributions),
  };
}

export async function GET() {
  try {
    // Fetch recent events and user data
    const [eventsRes, userRes, reposRes] = await Promise.all([
      githubFetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`
      ),
      githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      githubFetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=10`
      ),
    ]);

    if (!eventsRes.ok || !userRes.ok || !reposRes.ok) {
      return NextResponse.json(
        { error: "GitHub API error" },
        { status: eventsRes.status }
      );
    }

    const events = await eventsRes.json();
    const user = await userRes.json();
    const repos = await reposRes.json();

    // Fetch recent commits from the user's most recently pushed repos
    const recentCommits: any[] = [];
    for (const repo of repos.slice(0, 5)) {
      try {
        const commitsRes = await githubFetch(
          `https://api.github.com/repos/${repo.full_name}/commits?author=${GITHUB_USERNAME}&per_page=5`
        );
        if (commitsRes.ok) {
          const commits = await commitsRes.json();
          for (const commit of commits) {
            recentCommits.push({
              sha: commit.sha?.slice(0, 7),
              message: commit.commit?.message?.split("\n")[0]?.slice(0, 80),
              repo: repo.name,
              date: commit.commit?.author?.date,
            });
          }
        }
      } catch {
        // Skip repos that fail
      }
      if (recentCommits.length >= 15) break;
    }

    // Sort by date and take top 15
    recentCommits.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const topCommits = recentCommits.slice(0, 15);

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fromDate = new Date(todayUTC);
    fromDate.setUTCDate(fromDate.getUTCDate() - 209);
    const fromISO = `${fromDate.toISOString().slice(0, 10)}T00:00:00Z`;
    const toISO = `${todayUTC.toISOString().slice(0, 10)}T23:59:59Z`;

    // Preferred source: contribution calendar from GraphQL viewer, which can include private contributions.
    const calendarResult = await getViewerContributionMap(fromISO, toISO);

    // Fallback source: public push events + recent commits.
    const contributionMap: Record<string, number> = calendarResult?.map ?? {};
    if (!calendarResult) {
      for (const event of events) {
        if (event.type === "PushEvent") {
          const date = toUTCDateKey(event.created_at);
          if (date) {
            contributionMap[date] = (contributionMap[date] || 0) + 1;
          }
        }
      }

      for (const commit of recentCommits) {
        const date = toUTCDateKey(commit.date);
        if (date) {
          contributionMap[date] = (contributionMap[date] || 0) + 1;
        }
      }
    }

    // Generate last 210 days (30 weeks) for the heatmap.
    const days: { date: string; count: number; level: number }[] = [];
    for (let i = 209; i >= 0; i--) {
      const d = new Date(todayUTC);
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = contributionMap[dateStr] || 0;
      // More granular levels based on actual commit counts
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
      days.push({ date: dateStr, count, level });
    }

    // Calculate stats
    const totalCommits = Object.values(contributionMap).reduce(
      (a, b) => a + b,
      0
    );
    const activeDays = Object.keys(contributionMap).length;
    const currentStreak = calculateStreak(contributionMap);

    return NextResponse.json({
      user: {
        login: user.login,
        avatarUrl: user.avatar_url,
        publicRepos: user.public_repos,
        followers: user.followers,
      },
      recentCommits: topCommits,
      heatmap: days,
      includesPrivateContributions: calendarResult?.hasRestricted ?? false,
      stats: {
        totalCommits,
        activeDays,
        currentStreak,
        repos: user.public_repos,
      },
    });
  } catch (err) {
    console.error("GitHub API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}

function calculateStreak(map: Record<string, number>): number {
  let streak = 0;
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (map[dateStr] && map[dateStr] > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
    // Allow today to be 0 (hasn't committed yet today)
  }
  return streak;
}
