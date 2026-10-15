import { Controller } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card/Card.jsx';
import { IconSelect } from '../../../components/IconSelect/IconSelect.jsx';
import { ListEditor } from '../../../components/ListEditor/ListEditor.jsx';
import { PhotoField } from '../../../components/PhotoField/PhotoField.jsx';
import { TextInput } from '../../../components/TextInput/TextInput.jsx';
import { bind } from '../../../lib/forms.js';
import styles from './SportEditorPage.module.css';

const https = { pattern: { value: /^https:\/\//, message: 'Use a full https:// link' } };

function Section({ title, icon, children }) {
  return (
    <Card>
      <CardHeader title={title} icon={icon} />
      <div className={styles.body}>{children}</div>
    </Card>
  );
}

const Photo = ({ form, name, label }) => (
  <Controller name={name} control={form.control} render={({ field }) => <PhotoField label={label} name={label} shape="square" value={field.value} onChange={field.onChange} />} />
);

/** A list of { icon, <title>, text } cards (facts, benefits). */
function IconCards({ form, name, label, titleKey, max }) {
  const items = form.watch(`content.${name}`);
  return (
    <ListEditor form={form} name={`content.${name}`} label={label} hideLegend itemLabel={titleKey === 'label' ? 'fact' : 'benefit'} max={max} newItem={{ icon: 'star', [titleKey]: '', text: '' }}>
      {(path, index) => (
        <>
          <IconSelect label="Icon" current={items[index]?.icon} {...bind(form, `${path}.icon`)} />
          <TextInput label="Title" {...bind(form, `${path}.${titleKey}`, { required: 'Required' })} />
          <TextInput label="Text" multiline rows={2} className="full" {...bind(form, `${path}.text`, { required: 'Required' })} />
        </>
      )}
    </ListEditor>
  );
}

/** D4: what the sport's public Overview page says. */
export function ContentTab({ form }) {
  const text = (path, label, rows = 3) => <TextInput label={label} multiline rows={rows} {...bind(form, path)} />;
  return (
    <>
      <Section title="Hero" icon="flag">
        <div className={styles.grid}>
          <TextInput label="Eyebrow" placeholder="Turi Football" {...bind(form, 'content.hero.eyebrow')} />
          <TextInput label="Title" {...bind(form, 'content.hero.title')} />
        </div>
        {text('content.hero.text', 'Text')}
        <Photo form={form} name="content.hero.imageUrl" label="Hero image" />
      </Section>
      <Section title="History" icon="history">
        {text('content.history.text', 'Text', 5)}
        <Photo form={form} name="content.history.imageUrl" label="History image" />
      </Section>
      <Section title="Facts" icon="info">
        <IconCards form={form} name="facts" label="Facts" titleKey="label" max={10} />
      </Section>
      <Section title="Our approach" icon="strategy">
        {text('content.approach.strategic', 'Strategic')}
        {text('content.approach.character', 'Character')}
      </Section>
      <Section title="Benefits" icon="star">
        <IconCards form={form} name="benefits" label="Benefits" titleKey="title" max={9} />
      </Section>
      <Section title="Videos" icon="play_circle">
        <ListEditor form={form} name="content.videos" label="Videos" hideLegend itemLabel="video" max={6} newItem={{ title: '', duration: '', category: '', url: '', thumbnailUrl: null }}>
          {(path) => (
            <>
              <TextInput label="Title" {...bind(form, `${path}.title`, { required: 'Required' })} />
              <TextInput label="Length" placeholder="6:15" {...bind(form, `${path}.duration`)} />
              <TextInput label="Category" placeholder="Training" {...bind(form, `${path}.category`)} />
              <TextInput label="Link" placeholder="https://" className="full" {...bind(form, `${path}.url`, { required: 'Required', ...https })} />
            </>
          )}
        </ListEditor>
      </Section>
      <Section title="Pathways" icon="directions_run">
        <ListEditor form={form} name="content.pathways" label="Pathways" hideLegend itemLabel="pathway" max={6} newItem={{ title: '', text: '', url: '' }}>
          {(path) => (
            <>
              <TextInput label="Title" {...bind(form, `${path}.title`, { required: 'Required' })} />
              <TextInput label="Link (optional)" placeholder="https://" {...bind(form, `${path}.url`, https)} />
              <TextInput label="Text" multiline rows={2} className="full" {...bind(form, `${path}.text`, { required: 'Required' })} />
            </>
          )}
        </ListEditor>
      </Section>
    </>
  );
}
