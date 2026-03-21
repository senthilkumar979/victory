import FrameworkDiagram from './FrameworkDiagram'
import FrameworkExplanation from './FrameworkExplanation'

export const Framework = () => {
  return (
    <div className="flex w-full flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-16">
      <div className="min-h-0 w-full">
        <FrameworkDiagram />
      </div>
      <div className="min-h-0 w-full">
        <FrameworkExplanation />
      </div>
    </div>
  )
}