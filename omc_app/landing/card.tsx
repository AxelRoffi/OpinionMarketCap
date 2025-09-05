import * as React from "react"

interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

const Card = ({ className, children }: CardProps) => {
  return (
    <div className={`rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

const CardContent = ({ className, children }: CardContentProps) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export { Card, CardContent }