'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import React from 'react'
import { cn } from '../../lib/utils'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 4, showArrow = false, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-lg outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && (
        <PopoverPrimitive.Arrow className='-my-px fill-white dark:fill-slate-800' />
      )}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))

PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }

