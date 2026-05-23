'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { weightRecordSchema } from '@/core/domain'
import z from 'zod'
import { Button } from '../ui/button'
import { ConfirmDialog, ModalDialog } from '../ui/overlay'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { useOverlay } from '@/hooks/use-overlay'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

export type WeightRecordDTO = {
  id: string
  userId: string
  weight: number
  date: string
  createdAt: string
  updatedAt: string
}
import { IconPencil, IconTrash } from '@tabler/icons-react'

const editSchema = weightRecordSchema
  .pick({ weight: true })
  .extend({ weight: z.number().min(0, 'น้ำหนักต้องเป็นตัวเลขบวก') })

type EditFormValues = z.infer<typeof editSchema>

function EditDialog({ record }: { record: WeightRecordDTO }) {
  const queryClient = useQueryClient()
  const { closeOverlay } = useOverlay()
  const dialogKey = `edit-weight-${record.id}`

  const method = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { weight: record.weight },
  })

  const mutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      await axios.patch(`/api/record/${record.id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-records'] })
      closeOverlay(dialogKey)
    },
  })

  return (
    <ModalDialog
      title="แก้ไขน้ำหนัก"
      description="แก้ไขข้อมูลน้ำหนักของคุณ"
      trigger={
        <Button variant="ghost" size="sm">
          <IconPencil />
        </Button>
      }
      dialogKey={dialogKey}
    >
      <form onSubmit={method.handleSubmit((data) => mutation.mutate(data))}>
        <FieldGroup>
          <Controller
            name="weight"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`edit-weight-input-${record.id}`}>
                  น้ำหนัก (kg)
                </FieldLabel>
                <Input
                  {...field}
                  id={`edit-weight-input-${record.id}`}
                  type="number"
                  step="any"
                  min={0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    field.onChange(isNaN(value) ? 0 : value)
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}

function DeleteDialog({ record }: { record: WeightRecordDTO }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/record/${record.id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-records'] })
    },
  })

  const handleConfirm = useCallback(() => {
    mutation.mutate()
  }, [mutation])

  return (
    <ConfirmDialog
      title="ลบบันทึกน้ำหนัก"
      description="คุณต้องการลบบันทึกน้ำหนักนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้"
      confirmText="ลบ"
      cancelText="ยกเลิก"
      onConfirm={handleConfirm}
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <IconTrash />
        </Button>
      }
    />
  )
}

export default function WeightRecordsTable() {
  const { data, isLoading } = useQuery<WeightRecordDTO[]>({
    queryKey: ['weight-records'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<WeightRecordDTO[]>>('/api/record')
      return res.data.data ?? []
    },
  })

  const columns = useMemo<ColumnDef<WeightRecordDTO>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'วันที่',
        cell: ({ getValue }) => {
          const iso = getValue<string>()
          return new Date(iso).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        },
      },
      {
        accessorKey: 'weight',
        header: 'น้ำหนัก (kg)',
        cell: ({ getValue }) => `${getValue<number>().toFixed(2)} kg`,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 justify-end">
            <EditDialog record={row.original} />
            <DeleteDialog record={row.original} />
          </div>
        ),
      },
    ],
    [],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="w-full py-8 text-center text-sm text-muted-foreground">
        กำลังโหลด...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-8 text-center text-sm text-muted-foreground">
        ยังไม่มีบันทึกน้ำหนัก
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
