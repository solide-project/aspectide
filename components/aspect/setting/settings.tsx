import { IDESettings } from "@/components/core/components/ide-settings"
import { Title } from "@/components/core/components/title"

interface AspectSettingsProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AspectSetting({ className }: AspectSettingsProps) {
  return (
    <IDESettings>
      <Title text="Test" />
    </IDESettings>
  )
}