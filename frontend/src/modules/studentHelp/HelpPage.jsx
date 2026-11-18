import FAQ from './FAQ'
import HelpGuidance from './HelpGuidance'

export default function HelpPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-[40px]">Need help?</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Find answers to common questions, or see which portal or office to contact.
      </p>

      <div className="mt-12 grid items-start gap-x-8 gap-y-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <FAQ title="Common questions" />
        <HelpGuidance />
      </div>
    </div>
  )
}
