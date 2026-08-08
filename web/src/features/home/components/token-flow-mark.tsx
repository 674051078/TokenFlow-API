/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Waypoints } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TokenFlowMarkProps {
  className?: string
}

export function TokenFlowMark(props: TokenFlowMarkProps) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-[#171816] text-[#e76c4b] ring-1 ring-black/10 dark:bg-[#f2f2ec] dark:text-[#d85f3f] dark:ring-white/10',
        props.className
      )}
    >
      <Waypoints className='size-[18px]' strokeWidth={2.25} />
    </span>
  )
}
