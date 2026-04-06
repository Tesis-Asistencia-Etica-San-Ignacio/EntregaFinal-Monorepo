import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import isEqual from "lodash.isequal"
import { cn } from "@/lib/utils"
import {
    FormControl,
    FormField as ShadcnFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/atoms/ui/form"
import { Input } from "@/components/atoms/ui/input-form"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/atoms/ui/select"
import { Textarea } from "@/components/atoms/ui/textarea"
import type {
    FormField,
    SelectFormField,
    CustomFormField,
    TextAreaFormField,
    DateFormField,
    FieldType,
} from "@/types/formTypes"
import { LTMatch } from "@/lib/api/languageApi"
import CalendarPicker from "./calendars/DatePicker"

function baseValidationForType(type: FieldType): z.ZodTypeAny {
    let schema: z.ZodTypeAny

    switch (type) {
        case "email":
            schema = z.string().trim()
                .email("El email no es valido")
                .max(50, "Maximo 50 caracteres")
            break
        case "password":
            schema = z.string().trim()
                .max(200, "Maximo 200 caracteres")
            break
        case "phone":
            schema = z.string().trim()
                .regex(/^\d+$/, "Solo digitos")
                .max(10, "Maximo 10 digitos")
            break
        case "extension-phone":
            schema = z.string().trim()
                .regex(/^\d+$/, "Solo digitos")
                .max(2, "Maximo 2 digitos")
            break
        case "document":
            schema = z.string().trim().max(50, "Maximo 50 caracteres")
            break
        case "user":
            schema = z.string().trim().max(40, "Maximo 40 caracteres")
            break
        case "address":
            schema = z.string().trim().max(100, "Maximo 100 caracteres")
            break
        case "datePicker":
            schema = z.preprocess(
                (value) => {
                    if (value instanceof Date) return value
                    const date = new Date(value as any)
                    return Number.isNaN(date.getTime()) ? undefined : date
                },
                z.date({
                    required_error: "Este campo es requerido",
                    invalid_type_error: "Este campo es requerido",
                })
            )
            break
        case "number": {
            const preprocessNumber = z.preprocess(
                (value) => {
                    if (value === "" || value === null || value === undefined) return undefined
                    const parsed = Number(value)
                    return Number.isNaN(parsed) ? NaN : parsed
                },
                z.number().min(1, "El numero debe ser mayor a 0").optional()
            )

            schema = preprocessNumber.refine(
                (value) => value === undefined || !Number.isNaN(value),
                { message: "Debe ser un numero" }
            )
            break
        }
        default:
            schema = z.string().trim()
            break
    }

    return schema
}

export function buildZodSchemaForField(field: FormField): z.ZodTypeAny {
    let schema = baseValidationForType(field.type)

    if (field.required) {
        if (schema instanceof z.ZodString) {
            schema = schema.nonempty("Este campo es requerido")
        } else {
            schema = schema.refine(
                (value) => value !== undefined && value !== null && value !== "",
                { message: "Este campo es requerido" }
            )
        }
    }

    if (schema instanceof z.ZodString && typeof field.minLength !== "undefined") {
        schema = schema.min(field.minLength, `Minimo ${field.minLength} caracteres`)
    }

    if (typeof field.maxLength !== "undefined") {
        schema = (schema as z.ZodString).max(field.maxLength, `Maximo ${field.maxLength} caracteres`)
    }

    if (field.customValidation) {
        schema = schema.superRefine((value, ctx) => {
            const error = field.customValidation?.(value)
            if (error) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: error,
                })
            }
        })
    }

    return schema.default(field.type === "datePicker" ? new Date() : "")
}

function flattenFields(data: FormField[] | FormField[][]): FormField[] {
    if (!Array.isArray(data) || data.length === 0) return []
    if (Array.isArray(data[0])) return (data as FormField[][]).flat()
    return data as FormField[]
}

function formatSpellMessage(matches: LTMatch[] | undefined) {
    const warning = matches?.[0]
    if (!warning) return undefined

    const suggestions = Array.from(
        new Set(
            (warning.replacements ?? [])
                .map((replacement) => replacement.value.trim())
                .filter(Boolean)
        )
    ).slice(0, 3)

    return suggestions.length > 0
        ? `${warning.message} -> ${suggestions.join(", ")}`
        : warning.message
}

export interface DynamicFormHandles {
    handleSubmit: <T>(onValid: (data: any) => T) => (e?: React.BaseSyntheticEvent) => Promise<void>
    trigger: (name?: string | string[]) => Promise<boolean>
    reset: (values?: Record<string, any>) => void
    __formInstance?: ReturnType<typeof useForm>
}

export interface DynamicFormProps {
    formDataConfig: FormField[] | FormField[][]
    onSubmit?: (data: { [key: string]: any }) => void
    onChange?: (data: { [key: string]: any }) => void
    onSpellCheck?: (key: string, text: string) => void
    spellWarnings?: Record<string, LTMatch[]>
    containerClassName?: string
    initialData?: { [key: string]: any }
}

export const DynamicForm = forwardRef<DynamicFormHandles, DynamicFormProps>(({
    formDataConfig,
    onChange,
    onSpellCheck,
    containerClassName,
    spellWarnings = {},
    initialData = {},
}, ref) => {
    const flatFields = flattenFields(formDataConfig)

    const shape: Record<string, z.ZodTypeAny> = {}
    flatFields.forEach((field) => {
        shape[field.key] = buildZodSchemaForField(field).default("")
    })

    const finalSchema = z.object(shape)

    const form = useForm({
        resolver: zodResolver(finalSchema),
        defaultValues: initialData,
        mode: "onChange",
    })

    const {
        control,
        watch,
        formState: { errors },
        handleSubmit,
    } = form

    useImperativeHandle(ref, () => ({
        handleSubmit,
        trigger: form.trigger,
        __formInstance: form,
        reset: form.reset,
    }))

    useEffect(() => {
        const subscription = watch((values) => {
            onChange?.(values)
        })
        return () => subscription.unsubscribe()
    }, [watch, onChange])

    const prevInit = useRef(initialData)

    useEffect(() => {
        if (!isEqual(prevInit.current, initialData)) {
            const currentValues = form.getValues()

            if (!isEqual(currentValues, initialData)) {
                form.reset(initialData)
            }

            prevInit.current = initialData
        }
    }, [initialData, form])

    const renderField = (field: FormField) => {
        if (field.hidden === true) return null

        return (
            <ShadcnFormField
                key={field.key}
                control={control}
                name={field.key}
                render={({ field: controllerField }) => (
                    <FormItem
                        data-field-key={field.key}
                        className={cn(
                            field.width ? "max-w-full min-w-0" : "basis-0 flex-1 min-w-0",
                            "flex flex-col p-0.5"
                        )}
                        style={field.width ? { width: `${field.width}%` } : {}}
                    >
                        <FormLabel>{field.label ?? field.placeholder}</FormLabel>

                        <FormControl>
                            <div className="w-full min-w-0">
                                {(() => {
                                    if (field.type === "custom") {
                                        return (field as CustomFormField).component
                                    }

                                    if (field.type === "select") {
                                        const selectField = field as SelectFormField
                                        return (
                                            <Select
                                                value={controllerField.value || ""}
                                                onValueChange={controllerField.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={selectField.selectPlaceholder || selectField.placeholder}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectField.options.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )
                                    }

                                    if (field.type === "textarea") {
                                        const textAreaField = field as TextAreaFormField
                                        return (
                                            <Textarea
                                                autoAdjust={textAreaField.autoAdjust}
                                                placeholder={textAreaField.placeholder}
                                                value={controllerField.value || ""}
                                                onChange={controllerField.onChange}
                                                onBlur={(event) => onSpellCheck?.(field.key, event.target.value)}
                                            />
                                        )
                                    }

                                    if (field.type === "datePicker") {
                                        const dateField = field as DateFormField & { minDate?: Date; maxDate?: Date }
                                        return (
                                            <CalendarPicker
                                                value={controllerField.value as Date | undefined}
                                                onChange={controllerField.onChange}
                                                minDate={dateField.minDate}
                                                maxDate={dateField.maxDate}
                                                placeholder={dateField.placeholder}
                                                className="w-full"
                                            />
                                        )
                                    }

                                    const autoComplete =
                                        field.type === "password"
                                            ? field.key === "newPassword"
                                                ? "new-password"
                                                : "current-password"
                                            : field.type === "email"
                                                ? "email"
                                                : undefined

                                    return (
                                        <Input
                                            inputType={field.type}
                                            placeholder={field.placeholder}
                                            autoComplete={autoComplete}
                                            value={controllerField.value || ""}
                                            onChange={controllerField.onChange}
                                            onBlur={(event) => onSpellCheck?.(field.key, event.target.value)}
                                        />
                                    )
                                })()}
                            </div>
                        </FormControl>

                        <FormMessage className="min-h-[1.25rem]">
                            {errors[field.key]?.message as string || formatSpellMessage(spellWarnings[field.key])}
                        </FormMessage>
                    </FormItem>
                )}
            />
        )
    }

    const isMultipleRows =
        Array.isArray(formDataConfig) &&
        formDataConfig.length > 0 &&
        Array.isArray(formDataConfig[0])

    const renderRows = () => {
        const visibleRows = isMultipleRows
            ? (formDataConfig as FormField[][]).map((row) => row.filter((field) => !field.hidden))
            : (formDataConfig as FormField[]).filter((field) => !field.hidden)

        if (isMultipleRows) {
            return (visibleRows as FormField[][]).map((row, index) => (
                <div key={index} className="flex flex-wrap gap-4 mb-4">
                    {row.map((field) => renderField(field))}
                </div>
            ))
        }

        return (visibleRows as FormField[]).map((field) => (
            <div key={field.key} className="mb-4">
                {renderField(field)}
            </div>
        ))
    }

    return (
        <FormProvider {...form}>
            <div className={cn(containerClassName)}>
                {renderRows()}
            </div>
        </FormProvider>
    )
})
