'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button'
import 'react-day-picker/dist/style.css'

function Calendar ({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}) {
  const defaultClassNames = {
    months: 'relative flex flex-col sm:flex-row gap-4',
    month: 'w-full',
    month_caption: 'relative mx-10 mb-1 flex h-9 items-center justify-center z-20',
    caption_label: 'text-sm font-medium',
    nav: 'absolute top-0 flex w-full justify-between z-10',
    button_previous: cn(buttonVariants({ variant: 'ghost' }), 'size-9 text-slate-400 hover:text-slate-700 p-0'),
    button_next: cn(buttonVariants({ variant: 'ghost' }), 'size-9 text-slate-400 hover:text-slate-700 p-0'),
    weekday: 'size-9 p-0 text-xs font-medium text-slate-400',
    day_button: 'relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700',
    day: 'group size-9 px-0 text-sm',
    outside: 'text-slate-300',
    hidden: 'invisible',
  }

  const mergedClassNames = Object.keys(defaultClassNames).reduce((acc, key) => {
    acc[key] = classNames?.[key]
      ? cn(defaultClassNames[key], classNames[key])
      : defaultClassNames[key]
    return acc
  }, {})

  const defaultComponents = {
    Chevron: (props) => {
      if (props.orientation === 'left') {
        return <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden='true' />
      }
      return <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden='true' />
    },
  }

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('w-fit', className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }

