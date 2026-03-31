'use client'

import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from './select'

export function ChronoSelect ({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  yearRange = [1970, 2050],
}) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(value)
  const [month, setMonth] = React.useState(selected ?? new Date())

  React.useEffect(() => {
    setSelected(value)
    if (value) setMonth(value)
  }, [value])

  const years = React.useMemo(() => {
    const [start, end] = yearRange
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [yearRange])

  const handleSelect = (date) => {
    setSelected(date)
    setOpen(false)
    if (onChange) onChange(date)
  }

  const handleYearChange = (year) => {
    const newYear = parseInt(year, 10)
    const newDate = new Date(month)
    newDate.setFullYear(newYear)
    setMonth(newDate)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-slate-400',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selected ? format(selected, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='p-2 space-y-2 w-auto'>
        <div className='flex items-center justify-between px-1'>
          <span className='text-sm font-medium'>
            {format(month, 'MMMM')}
          </span>
          <Select
            value={String(month.getFullYear())}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className='h-7 w-[90px] text-xs'>
              <SelectValue placeholder='Year' />
            </SelectTrigger>
            <SelectContent className='max-h-48'>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode='single'
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          className='rounded-md border'
        />
      </PopoverContent>
    </Popover>
  )
}

