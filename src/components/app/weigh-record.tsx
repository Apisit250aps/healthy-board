'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { weightRecordSchema } from '@/core/domain'
import z from 'zod'
import { Button } from '../ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { DockIcon } from '../ui/dock'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { IconScaleOutline } from '@tabler/icons-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModalDialog } from '../ui/overlay'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback } from 'react'

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
        onSuccess: (data, variables, _, context) => {
          context.client.invalidateQueries({ queryKey: ['weight-records'] })
          method.reset()
        },
      })
    },
    [recordMutation, method],
  )
  return (
    <ModalDialog
      title="บันทึกน้ำหนัก"
      description="กรุณากรอกน้ำหนักของคุณ"
      trigger={children}
    >
      <form
        onSubmit={method.handleSubmit(onSubmit)}
      >
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
          <Button type="submit">บันทึก</Button>
        </div>
      </form>
    </ModalDialog>
  )
}
