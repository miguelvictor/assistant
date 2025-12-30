import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Props {
  value: string
  onChange: (newValue: string | null) => void
}

export function ProviderSelector({ value, onChange }: Props) {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 mx-auto flex max-w-176 items-center gap-4 bg-black/20 px-2 py-4 backdrop-blur-sm">
      <div className="text-sm tracking-tighter">Choose a provider: </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="gemini">Gemini</SelectItem>
          <SelectItem value="anthropic">Anthropic</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
