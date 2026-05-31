import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('border-border/50', className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          {icon && (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
        {change && (
          <div className={cn(
            'text-sm font-medium',
            changeType === 'positive' && 'text-green-600 dark:text-green-400',
            changeType === 'negative' && 'text-destructive',
            changeType === 'neutral' && 'text-muted-foreground'
          )}>
            {changeType === 'positive' && '↑'} {changeType === 'negative' && '↓'} {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
