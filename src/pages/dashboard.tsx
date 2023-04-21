import { type NextPage } from 'next'
import Head from 'next/head'

import { api } from '@/utils/api'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { Short } from '@prisma/client'
import { nanoid } from 'nanoid'
import { env } from '@/env.mjs'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

const Home: NextPage = () => {
  const { data: list } = api.short.list.useQuery(undefined, {
    initialData: [],
  })

  const utils = api.useContext()
  const { mutate: add } = api.short.add.useMutation({
    async onMutate(newShort) {
      await utils.short.list.cancel()
      const prevData = utils.short.list.getData()
      utils.short.list.setData(undefined, (old = []) => [...old, newShort as Short])

      return { prevData }
    },
    onError(err, newPost, ctx) {
      utils.short.list.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.short.list.invalidate()
    },
  })

  const { mutate: del } = api.short.delete.useMutation({
    async onMutate({ slug }) {
      await utils.short.list.cancel()
      const prevData = utils.short.list.getData()
      utils.short.list.setData(undefined, (old = []) => old.filter((s) => s.slug !== slug))

      return { prevData }
    },
    onError(err, newPost, ctx) {
      utils.short.list.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.short.list.invalidate()
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const slug = e.currentTarget.slug.value
    const target = e.currentTarget.target_url.value

    add({ slug, target, id: nanoid() })
  }

  const columns: GridColDef<Short>[] = [
    {
      field: 'slug',
      headerName: 'Slug',
      width: 150,
      editable: true,
    },
    {
      field: 'target',
      headerName: 'Target',
      minWidth: 300,
      flex: 1,
      editable: true,
    },
    {
      field: 'shortUrl',
      headerName: 'Short URL',
      renderCell(params) {
        return (
          <Stack
            sx={{ cursor: 'pointer' }}
            direction="row"
            spacing={1}
            alignItems="center"
            onClick={() => {
              navigator.clipboard.writeText(`${env.NEXT_PUBLIC_APP_URL}/${params.row.slug}`)
              toast.success('Copied to clipboard')
            }}
          >
            <Typography variant="body2">{`${env.NEXT_PUBLIC_APP_URL}/${params.row.slug}`}</Typography>
            <Image src="/copy.png" alt="Copy" width={16} height={16} />
          </Stack>
        )
      },
      flex: 1,
    },
    {
      field: 'action',
      headerName: '',
      renderCell(params) {
        return (
          <Box sx={{ cursor: 'pointer' }} onClick={() => del({ slug: params.row.slug })}>
            <Image src="/trash.png" alt="Copy" width={16} height={16} />
          </Box>
        )
      },
      width: 100,
    },
  ]

  return (
    <>
      <Head>
        <title>Short</title>
      </Head>

      <Box component="form" onSubmit={onSubmit}>
        <Stack direction="row">
          <TextField required id="slug" label="Slug" variant="filled" />
          <TextField required id="target_url" label="Target URL" variant="filled" />
          <Button type="submit">Add</Button>
        </Stack>

        <DataGrid columns={columns} rows={list} />
      </Box>
    </>
  )
}

export default Home
