/**
 * TemperatureSlider Component
 *
 * Slider control for temperature setting.
 */

import { Slider } from './ui/index'
import { cn } from '../lib/utils'

interface TemperatureSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showLabel?: boolean
}

const temperatureLabels = {
  precise: { value: 0.2, label: 'Precise', description: 'Focused & factual' },
  balanced: { value: 0.7, label: 'Balanced', description: 'Recommended' },
  creative: { value: 1.0, label: 'Creative', description: 'Imaginative' },
}

export function TemperatureSlider({
  value,
  onChange,
  min = 0,
  max = 2,
  step = 0.1,
  disabled = false,
  showLabel = true,
}: TemperatureSliderProps) {
  const getLabel = (temp: number) => {
    if (temp <= 0.3) return temperatureLabels.precise.label
    if (temp <= 0.8) return temperatureLabels.balanced.label
    return temperatureLabels.creative.label
  }

  const getDescription = (temp: number) => {
    if (temp <= 0.3) return temperatureLabels.precise.description
    if (temp <= 0.8) return temperatureLabels.balanced.description
    return temperatureLabels.creative.description
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Temperature</label>
          <div className="text-right">
            <div className="text-sm font-semibold">{value.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              {getLabel(value)}
            </div>
          </div>
        </div>
      )}

      {/* Slider */}
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="cursor-pointer"
      />

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {getDescription(value)}
      </p>

      {/* Quick presets */}
      <div className="flex gap-1">
        <PresetButton
          label="Precise"
          value={temperatureLabels.precise.value}
          isActive={value === temperatureLabels.precise.value}
          onClick={() => onChange(temperatureLabels.precise.value)}
          disabled={disabled}
        />
        <PresetButton
          label="Balanced"
          value={temperatureLabels.balanced.value}
          isActive={value === temperatureLabels.balanced.value}
          onClick={() => onChange(temperatureLabels.balanced.value)}
          disabled={disabled}
        />
        <PresetButton
          label="Creative"
          value={temperatureLabels.creative.value}
          isActive={value === temperatureLabels.creative.value}
          onClick={() => onChange(temperatureLabels.creative.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

interface PresetButtonProps {
  label: string
  value: number
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

function PresetButton({
  label,
  isActive,
  onClick,
  disabled,
}: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-1 text-xs py-1 px-2 rounded border transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-input hover:bg-accent',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {label}
    </button>
  )
}
