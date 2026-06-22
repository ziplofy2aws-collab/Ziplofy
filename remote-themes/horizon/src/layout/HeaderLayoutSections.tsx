import { AnnouncementBar } from './AnnouncementBar';
import { CustomSection } from './CustomSection';
import { Divider } from './Divider';
import { Header } from './Header';

type Props = { sectionId: string };

/** Renders one header-group layout section instance (announcement bar, header, etc.). */
export function HeaderLayoutSections({ sectionId }: Props) {
  if (sectionId === 'header' || sectionId.startsWith('header_')) {
    return <Header sectionId={sectionId} />;
  }
  if (sectionId === 'announcement_bar' || sectionId.startsWith('announcement_bar_')) {
    return <AnnouncementBar sectionId={sectionId} />;
  }
  if (sectionId === 'divider' || sectionId.startsWith('divider_')) {
    return <Divider sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'custom_section' || sectionId.startsWith('custom_section_')) {
    return <CustomSection sectionId={sectionId} placement="layout" />;
  }
  return null;
}
