import { CAL_CONSULT_URL } from '@/lib/cal-links'
import type { Metadata } from 'next'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore EMVY advice, integrations, custom systems, team training, and ongoing support.',
}

const stages = [
  {
    number: '01', id: 'assessment', title: 'Advice and planning', imageSide: 'left',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'People having a focused business conversation',
    description: 'Make sense of the options, assess where AI could help, and decide what to tackle first.',
    points: ['Map the people, processes, systems and repeated work involved.', 'Identify a useful starting point and where AI is a sensible fit.', 'Agree what progress would look like before choosing tools or a build.'],
  },
  {
    number: '02', id: 'integrations', title: 'Setup and integrations', imageSide: 'right',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A team planning how business tools work together',
    description: 'Choose and configure suitable tools, then connect them with the systems and processes you already use.',
    points: ['Keep the setup proportionate to the work.', 'Connect useful information and handoffs between tools.', 'Make access, review points and ownership clear.'],
  },
  {
    number: '03', id: 'builds', title: 'Agents and custom systems', imageSide: 'left',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A person working with connected business systems',
    description: 'Build tailored assistants and workflows when the work calls for more than an off-the-shelf setup.',
    points: ['Shape the system around a defined workflow and outcome.', 'Connect calls, enquiries, follow-up, admin, information or handoffs where useful.', 'Test real examples and keep human review where it matters.'],
  },
  {
    number: '04', id: 'training', title: 'Team training', imageSide: 'right',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A team learning together',
    description: 'Help your people use AI in their day-to-day work, with practical examples, clear boundaries and hands-on guidance.',
    points: ['Practise with the work your team actually handles.', 'Make review, privacy and escalation boundaries clear.', 'Give people useful guidance they can return to.'],
  },
  {
    number: '05', id: 'improvement', title: 'Ongoing guidance and support', imageSide: 'left',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A team reviewing and improving a system together',
    description: 'Keep improving what is in place, work through new questions and adapt as your business and the tools change.',
    points: ['Review what is working and where the next improvement is useful.', 'Refine the system as people, tools and priorities change.', 'Keep a clear path for support and future additions.'],
  },
]

export default function ServicesPage() {
  return <>
    <PageHero eyebrow="Services" title="Support from first idea to everyday use." description="Advice, setup, custom systems, team training and ongoing guidance shaped around your work." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=90&auto=format&fit=crop">
      <a href={CAL_CONSULT_URL} className="button light" target="_blank" rel="noopener noreferrer">Book a 20-minute AI Consult</a>
    </PageHero>

    <section className="section service-flow-intro" id="consult">
      <p className="section-kicker">Ways we can help</p>
      <h2 className="section-title">Start where you need us.</h2>
      <p className="section-text">A free 20-minute AI Consult is one place to begin. From there, the right help might be advice, a tool setup, a tailored system, training or ongoing support.</p>
    </section>

    {stages.map((stage) => <section className="section service-stage" id={stage.id} key={stage.id}>
      <div className={`service-stage__grid ${stage.imageSide === 'right' ? 'service-stage__grid--reverse' : ''}`}>
        <div className="service-stage__image"><img src={stage.image} alt={stage.imageAlt} /></div>
        <div className="service-stage__copy">
          <p className="section-kicker">{stage.number} — {stage.title}</p>
          <h2>{stage.title}</h2>
          <p>{stage.description}</p>
          <ul>{stage.points.map((point) => <li key={point}>{point}</li>)}</ul>
        </div>
      </div>
    </section>)}

    <section className="section final-cta-section">
      <div className="section-header"><p className="section-kicker">Start here</p><h2 className="section-title">Not sure which stage fits? Start with a conversation.</h2><p className="section-text">A free 20-minute AI Consult is a simple place to start. We can work out the useful next step together.</p></div>
      <a href={CAL_CONSULT_URL} className="button primary" target="_blank" rel="noopener noreferrer">Book a 20-minute AI Consult</a>
    </section>
  </>
}
