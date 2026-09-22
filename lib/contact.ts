import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  website: z.string().trim().max(200).optional(),
});
