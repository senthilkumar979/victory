import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FormMultiInput } from './FormMultiInput'

interface FormMultiInputWithStateProps
  extends Partial<React.ComponentProps<typeof FormMultiInput>> {
  initialValue?: string[]
}

const FormMultiInputWithState = ({
  initialValue,
  value: valueProp,
  ...props
}: FormMultiInputWithStateProps) => {
  const [value, setValue] = useState<string[]>(
    initialValue ?? valueProp ?? [],
  )

  return (
    <div className="w-full max-w-md">
      <FormMultiInput
        {...props}
        label={props.label ?? 'Tags'}
        value={value}
        onChange={setValue}
      />
    </div>
  )
}

const meta: Meta<typeof FormMultiInput> = {
  title: 'Molecules/FormMultiInput',
  component: FormMultiInput,
  argTypes: {
    validationStatus: {
      control: 'radio',
      options: ['default', 'valid', 'invalid'],
    },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    disabled: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    maxTags: { control: { type: 'number', min: 0 } },
  },
  args: {
    label: 'Tags',
    placeholder: 'Type and press comma to add',
    helperText:
      'Add items separated by commas. Press Backspace to remove the last tag.',
    validationStatus: 'default',
    isRequired: false,
  },
}

export default meta

type Story = StoryObj<typeof FormMultiInput>

export const Default: Story = {
  render: (args) => <FormMultiInputWithState {...args} />,
}

export const WithInitialTags: Story = {
  render: (args) => (
    <FormMultiInputWithState
      {...args}
      initialValue={['React', 'TypeScript', 'Node.js']}
    />
  ),
}

export const Valid: Story = {
  render: (args) => (
    <FormMultiInputWithState
      {...args}
      validationStatus="valid"
      helperText="Looks good."
    />
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <FormMultiInputWithState
      {...args}
      validationStatus="invalid"
      errorMessage="At least one tag is required."
    />
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <FormMultiInputWithState
      {...args}
      initialValue={['Tag1', 'Tag2']}
      disabled
    />
  ),
}

export const MaxTags: Story = {
  render: (args) => (
    <FormMultiInputWithState
      {...args}
      initialValue={['React', 'TypeScript']}
      maxTags={3}
      helperText="Maximum 3 tags allowed."
    />
  ),
}
