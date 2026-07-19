# Form Patterns (React Hook Form)

## The bug we fixed

Users could fill in a drawer form, click Save, and see validation errors even though fields looked populated. Root cause:

1. **`FormInput` is not a ref-forwarding wrapper** — it renders a native `<input>` internally but does not use `forwardRef`, so `{...register('field')}` cannot reliably attach RHF's ref/onChange wiring.
2. **Uncontrolled + custom wrapper** — spreading `register()` onto `FormInput` puts RHF in uncontrolled mode through a component that breaks the contract.
3. **`reset()` on drawer open** — drawers call `form.reset(...)` when opened. RHF state resets, but the DOM can keep stale values when refs were never wired correctly → **UI shows values, submit payload is empty**.

This was fixed in `VideoFormFields.tsx` and `MeetingFormFields.tsx` by using **`Controller`** with explicit `value` / `onChange` / `onBlur`.

## When to use `Controller` vs `register()`

| Field type | Use |
|---|---|
| `FormInput`, `FormMultiInput`, `CalendarInput`, `MarkdownEditor`, `UserSearch`, other custom wrappers | **`Controller`** with explicit `value` + `onChange` |
| Native `<input>`, `<textarea>`, `<select>` rendered directly in the form fields component | **`register()`** is fine |
| Checkboxes / radios on native elements | **`register()`** is fine |

**Rule:** If the component is not a plain native HTML form element in your JSX, use `Controller`.

## Correct pattern

```tsx
<Controller
  name="title"
  control={control}
  render={({ field }) => (
    <FormInput
      id={`${formId}-title`}
      label="Title"
      isDarkMode
      isRequired
      errorMessage={errors.title?.message}
      validationStatus={errors.title ? 'invalid' : 'default'}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  )}
/>
```

Native select (OK with `register()`):

```tsx
<select id={`${formId}-category`} {...register('category')}>
  <option value="">Select category</option>
</select>
```

## Incorrect pattern

```tsx
// DO NOT — ref never reaches the inner <input>
<FormInput
  id={`${formId}-title`}
  label="Title"
  {...register('title')}
/>
```

## Canonical examples

- `src/app/modules/Meetings/MeetingFormFields.tsx` — text, textarea, selects, calendar, links
- `src/app/modules/Videos/VideoFormFields.tsx` — text inputs, controlled select, checkbox

## Checklist before creating a new form

- [ ] Custom input component? → use `Controller`, not `register()`
- [ ] Drawer/modal resets on open? → controlled fields are **required**
- [ ] Submit button outside `<form>`? → use `form="my-form-id"` on the button
- [ ] Zod schema + `zodResolver` wired in the drawer/page hook
- [ ] Error messages passed via `errorMessage` / `validationStatus` on `FormInput`
- [ ] Add a regression test if the form lives in a drawer with `reset()` on open

## Testing guidance

Follow `VideoFormFields.test.tsx` / `PartnerFormFields.test.tsx`:

1. Render a test harness with `useForm` + `zodResolver`.
2. Simulate drawer open with `useEffect(() => reset(defaultValues), [isOpen])`.
3. Type into fields, click Save (optionally via external `form=` button).
4. Assert `handleSubmit` received the typed values — not empty strings.

This catches the UI/state desync that unit-testing `register()` alone will miss.
