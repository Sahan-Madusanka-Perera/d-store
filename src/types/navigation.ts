export interface NavCategory {
  id: number;
  label: string;
  href: string;
  icon_name: string;
  sort_order: number;
  dropdown_items?: NavDropdownItem[];
}

export interface NavDropdownItem {
  id: number;
  category_id: number;
  label: string;
  href: string;
  sort_order: number;
}
