'use client'

import { weightRecordSchema } from '@/core/domain'
import z from 'zod'
import { Button } from '../ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalDialog } from '../ui/overlay'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOverlay } from '@/hooks/use-overlay'
import axios from 'axios'
import { useCallback } from 'react'

const DIALOG_KEY = 'weigh-record-create'

const schema = weightRecordSchema
  .omit({
    id: true,
    userId: true,
    date: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    weight: z.number().min(0, 'น้ำหนักต้องเป็นตัวเลขบวก'),
  })

type WeightRecordFormValues = z.infer<typeof schema>

export default function WeighRecord({
  children,
}: {
  children?: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const { closeOverlay } = useOverlay()
  const method = useForm<WeightRecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weight: 0,
    },
  })

  const recordMutation = useMutation({
    mutationFn: async (data: WeightRecordFormValues) => {
      const response = await axios.post('/api/record', data)
      return response.data
    },
  })

  const onSubmit = useCallback(
    (data: WeightRecordFormValues) => {
      recordMutation.mutate(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['weight-records'] })
          method.reset()
          closeOverlay(DIALOG_KEY)
        },
      })
    },
    [recordMutation, method, queryClient, closeOverlay],
  )
  return (
    <ModalDialog
      title="บันทึกน้ำหนัก"
      description="กรุณากรอกน้ำหนักของคุณ"
      trigger={children}
      dialogKey={DIALOG_KEY}
    >
      <form onSubmit={method.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="weight"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-weight">น้ำหนัก</FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-demo-weight"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your weight"
                  autoComplete="off"
                  type="number"
                  min={0}
                  step="any"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    field.onChange(isNaN(value) ? 0.0 : value)
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
          <Button type="submit" disabled={recordMutation.isPending}>
            {recordMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
