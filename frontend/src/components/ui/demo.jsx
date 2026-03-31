'use client'

import React from 'react'
import { ChronoSelect } from './chrono-select'

export default function ChronoSelectDemo () {
  const [date, setDate] = React.useState()

  return (
    <div className='p-8 space-y-6'>
      <h1 className='text-xl font-semibold'>Date Picker Demo</h1>

      <ChronoSelect
        value={date}
        onChange={setDate}
        yearRange={[1990, 2035]}
      />

      {date && (
        <p className='text-sm text-slate-500'>
          You selected: {date.toDateString()}
        </p>
      )}
    </div>
  )
}

