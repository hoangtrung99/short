import { prisma } from '@/server/db'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (!slug) return res.status(404).send('Not found.')

  const short = await prisma.short.findFirst({
    where: {
      slug: slug as string,
    },
  })

  if (!short) return res.status(404).send('Not found.')

  res.status(301).redirect(short.target)
}
