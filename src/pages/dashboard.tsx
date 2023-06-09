import { type NextPage } from 'next'
import Head from 'next/head'

import { api } from '@/utils/api'
import { DataGrid, GridCellEditStopParams, GridColDef } from '@mui/x-data-grid'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { Short } from '@prisma/client'
import { nanoid } from 'nanoid'
import { env } from '@/env.mjs'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

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
    onError(err, _, ctx) {
      toast.error(err.message)
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
    onError(err, _, ctx) {
      toast.error(err.message)
      utils.short.list.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.short.list.invalidate()
    },
  })

  const { mutate: update } = api.short.update.useMutation({
    async onMutate(updatedShort) {
      await utils.short.list.cancel()
      const prevData = utils.short.list.getData()
      utils.short.list.setData(undefined, (old = []) =>
        old.map((s) => (s.slug === updatedShort.slug ? (updatedShort as Short) : s)),
      )

      return { prevData }
    },
    onError(err, _, ctx) {
      utils.short.list.setData(undefined, ctx?.prevData)
      toast.error(err.message)
    },
    onSuccess() {
      toast.success('Updated')
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
    e.currentTarget.reset()
  }

  const columns: GridColDef<Short>[] = [
    {
      field: 'slug',
      headerName: 'Slug',
      width: 150,
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

  const handleEditCell = (params: GridCellEditStopParams) => {
    const old = list.find((s) => s.id === params.row.id)
    if (params.row.target === old?.target) return
    update({ target: params.row.target, slug: params.row.slug, id: params.row.id })
  }

  return (
    <>
      <Head>
        <title>Short</title>
      </Head>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" component="form" onSubmit={onSubmit}>
            <TextField required id="slug" label="Slug" variant="filled" />
            <TextField required id="target_url" label="Target URL" variant="filled" />
            <Button type="submit">Add</Button>
          </Stack>

          <Button>
            <Link href="/api/playground"> API PLAYGROUND</Link>
          </Button>
        </Stack>

        <DataGrid columns={columns} rows={list} onCellEditStop={handleEditCell} />
      </Box>
    </>
  )
}

export default Home
