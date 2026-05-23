'use client'

import { userSchema } from '@/core/domain'
import z from 'zod'
import { Button } from '../ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { ModalDialog } from '../ui/overlay'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOverlay } from '@/hooks/use-overlay'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useCallback, useEffect } from 'react'

export const EDIT_PROFILE_DIALOG_KEY = 'edit-profile-dialog'

const schema = userSchema
  .pick({ name: true, weight: true, height: true })
  .partial()
  .extend({ name: z.string().min(1, 'กรุณากรอกชื่อ') })

type EditProfileFormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: Partial<EditProfileFormValues>
  trigger?: React.ReactNode
}

export default function EditProfileDialog({ defaultValues, trigger }: Props) {
  const queryClient = useQueryClient()
  const { closeOverlay } = useOverlay()

  const method = useForm<EditProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      weight: defaultValues?.weight,
      height: defaultValues?.height,
    },
  })

  useEffect(() => {
    method.reset({
      name: defaultValues?.name ?? '',
      weight: defaultValues?.weight,
      height: defaultValues?.height,
    })
  }, [
    defaultValues?.name,
    defaultValues?.weight,
    defaultValues?.height,
    method,
  ])

  const mutation = useMutation({
    mutationFn: async (data: EditProfileFormValues) => {
      await axios.patch('/api/me', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      closeOverlay(EDIT_PROFILE_DIALOG_KEY)
    },
  })

  const onSubmit = useCallback(
    (data: EditProfileFormValues) => {
      mutation.mutate(data)
    },
    [mutation],
  )

  return (
    <ModalDialog
      title="แก้ไขโปรไฟล์"
      description="แก้ไขข้อมูลส่วนตัวของคุณ"
      trigger={trigger}
      dialogKey={EDIT_PROFILE_DIALOG_KEY}
    >
      <form onSubmit={method.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-name">ชื่อ</FieldLabel>
                <Input
                  {...field}
                  id="profile-name"
                  placeholder="ชื่อของคุณ"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="weight"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-weight">น้ำหนัก (kg)</FieldLabel>
                <Input
                  {...field}
                  id="profile-weight"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="น้ำหนักของคุณ"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    field.onChange(isNaN(value) ? undefined : value)
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="height"
            control={method.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-height">ส่วนสูง (cm)</FieldLabel>
                <Input
                  {...field}
                  id="profile-height"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="ส่วนสูงของคุณ"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    field.onChange(isNaN(value) ? undefined : value)
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
