import FAQ from './FAQ'
import HelpGuidance from './HelpGuidance'

// MODULE 3 – Student Guidance and Help
export default function HelpPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Need help?</h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-deep">
        Find answers to common questions, or see which office or portal to contact.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <FAQ title="Common questions" />
        <HelpGuidance />
      </div>
    </div>
  )
}
