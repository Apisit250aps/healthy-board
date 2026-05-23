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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

const DIALOG_KEY = 'weigh-record-create'

const schema = weightRecordSchema
  .omit({
    id: true,
    userId: true,
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
      date: new Date(),
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
          queryClient.invalidateQueries({})
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
          <Controller
            name="date"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-date">
                  วันที่บันทึก
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="form-rhf-demo-date"
                      variant="outline"
                      data-empty={!field.value}
                      className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    >
                      <CalendarIcon />
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>เลือกวันที่</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(d) => field.onChange(d ?? new Date())}
                    />
                  </PopoverContent>
                </Popover>
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
