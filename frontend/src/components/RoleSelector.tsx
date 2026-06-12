/**
 * RoleSelector Component
 *
 * Dropdown selector for LLM role selection.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { LLMRole } from '@/types'

interface RoleSelectorProps {
  value: LLMRole
  onChange: (role: LLMRole) => void
  roles?: LLMRole[]
  disabled?: boolean
}

const roleDescriptions: Record<LLMRole, string> = {
  assistant: 'General AI Assistant',
  coder: 'Programming Expert',
  tutor: 'Educational Guide',
  creative: 'Creative Writer',
}

export function RoleSelector({
  value,
  onChange,
  roles = ['assistant', 'coder', 'tutor', 'creative'],
  disabled = false,
}: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="role" className="text-sm font-medium">
        Role
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex flex-col">
                <span className="capitalize font-medium">{role}</span>
                <span className="text-xs text-muted-foreground">
                  {roleDescriptions[role]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
