import ora, { type Options } from 'ora';

type Spinner = {
  text: Options['text']
}

export default function spinner({ 
  text,
}: Spinner) {
  return ora({ text });
}