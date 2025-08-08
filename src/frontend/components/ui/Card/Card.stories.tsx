import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevated', 'outline', 'filled', 'unstyled'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a basic card with some content.',
  },
};

export const WithHeader: Story = {
  args: {
    header: 'Card Header',
    children: 'This card has a header section.',
  },
};

export const WithFooter: Story = {
  args: {
    children: 'This card has a footer section.',
    footer: 'Card Footer',
  },
};

export const Complete: Story = {
  args: {
    header: 'Card Title',
    children: 'This is the main content of the card. It can contain any React components or text.',
    footer: 'Card Actions',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    header: 'Elevated Card',
    children: 'This card has an elevated appearance with shadow.',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    header: 'Outline Card',
    children: 'This card has an outline border.',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    header: 'Filled Card',
    children: 'This card has a filled background.',
  },
}; 