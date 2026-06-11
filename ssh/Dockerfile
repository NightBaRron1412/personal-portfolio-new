# --- build ---
FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
# go.mod requires are resolved here, so a fresh checkout builds without a vendored go.sum.
RUN go mod tidy && CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /bin/term .

# --- run ---
FROM alpine:3.20
RUN adduser -D -h /app term
WORKDIR /app
COPY --from=build /bin/term /app/term
RUN mkdir -p /app/.ssh && chown -R term /app
USER term
ENV HOST=0.0.0.0 PORT=2222
EXPOSE 2222
CMD ["/app/term"]
