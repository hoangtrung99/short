import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const shortRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.short.findMany()
  }),
  add: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().min(1).max(255),
        target: z.string().min(1).max(300),
        author: z.string().nullable().default('Anonymous'),
        isEnabled: z.boolean().nullable().default(true),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.short.create({
        data: input,
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().min(1).max(255),
        target: z.string().min(1).max(300).optional(),
        author: z.string().nullable().optional(),
        isEnabled: z.boolean().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id: _, ...data } = input

      return ctx.prisma.short.update({
        where: {
          slug: input.slug,
        },
        data,
      })
    }),
  delete: publicProcedure.input(z.object({ slug: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.short.delete({
      where: {
        slug: input.slug,
      },
    })
  }),
})
