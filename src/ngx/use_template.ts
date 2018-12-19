import {NgxElement} from './jsx';

export const pendingTemplates = new Set<NgxElement<{}>>();
export function useTemplate(template: NgxElement<{}>) {
  pendingTemplates.add(template);
}
