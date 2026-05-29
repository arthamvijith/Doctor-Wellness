import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { assistants } from '../data/landingData.js';

function Ecosystem() {
  return (
    <section id="modules" className="ecosystem section-wrap">
      <SectionHeader label="The Doctor Wellness Ecosystem" title="Integrated Intelligence" />
      <div className="assistant-grid">
        {assistants.map((assistant, index) => {
          const Icon = assistant.icon;
          return (
            <motion.article
              className="assistant-card"
              key={assistant.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className="icon-chip">
                <Icon size={18} />
              </div>
              <h3>{assistant.title}</h3>
              <ul>
                {assistant.points.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={14} /> {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default Ecosystem;
