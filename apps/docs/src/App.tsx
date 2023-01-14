import { createAvatarComponent } from '@dashly/core/src';

const Avatar = createAvatarComponent({
  getImageUrl: (name: string) => name,
});

export default function App() {
  return <Avatar text='s' />;
}
