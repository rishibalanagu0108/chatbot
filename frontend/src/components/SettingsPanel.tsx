/**
 * SettingsPanel Component
 *
 * Panel for configuring chat settings (role, temperature, max tokens).
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { RoleSelector } from './RoleSelector'
import { TemperatureSlider } from './TemperatureSlider'
import type { LLMRole } from '@/types'

interface SettingsPanelProps {
  role: LLMRole
  temperature: number
  maxTokens: number
  onRoleChange: (role: LLMRole) => void
  onTemperatureChange: (temp: number) => void
  onMaxTokensChange: (tokens: number) => void
  disabled?: boolean
  compact?: boolean
}

export function SettingsPanel({
  role,
  temperature,
  maxTokens,
  onRoleChange,
  onTemperatureChange,
  onMaxTokensChange,
  disabled = false,
  compact = false,
}: SettingsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={compact ? 'text-lg' : 'text-xl'}>Settings</CardTitle>
        <CardDescription>Configure LLM behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selector */}
        <RoleSelector
          value={role}
          onChange={onRoleChange}
          disabled={disabled}
        />

        {/* Temperature Slider */}
        <TemperatureSlider
          value={temperature}
          onChange={onTemperatureChange}
          disabled={disabled}
        />

        {/* Max Tokens */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="max-tokens" className="text-sm font-medium">
              Max Tokens
            </label>
            <span className="text-sm font-semibold text-primary">
              {maxTokens}
            </span>
          </div>
          <input
            id="max-tokens"
            type="range"
            min="100"
            max="4000"
            step="100"
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(Number(e.target.value))}
            disabled={disabled}
            className="h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="text-xs text-muted-foreground">
            Response length: {maxTokens} tokens (≈{Math.round(maxTokens * 4)} characters)
          </div>
        </div>

        {/* Info section */}
        <div className="bg-muted p-3 rounded-md text-xs space-y-1">
          <p className="font-semibold text-sm">💡 Tips:</p>
          <p>• Role changes the LLM's behavior and expertise</p>
          <p>• Temperature controls randomness (0=precise, 2=creative)</p>
          <p>• More tokens = longer responses but slower & costlier</p>
        </div>
      </CardContent>
    </Card>
  )
}
