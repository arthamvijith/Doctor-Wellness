import { Bot, ShieldCheck } from 'lucide-react';

function Burnout() {
  return (
    <section className="burnout section-wrap">
      <h2>Built to solve clinical burnout.</h2>
      <div className="burnout-grid">
        <article>
          <span>
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3>Save 15+ Hours Weekly</h3>
            <p>Automate repetitive note-taking and administrative forms that bog down your workflow.</p>
          </div>
        </article>
        <article>
          <span className="blue">
            <Bot size={16} />
          </span>
          <div>
            <h3>Reduce Cognitive Load</h3>
            <p>Let the AI handle the data retrieval and synthesis while you focus on the human connection.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Burnout;
