insert into public.skills (slug, name_zh, name_en, category, is_active)
values
  ('frontend', '前端开发', 'Frontend development', 'engineering', true),
  ('backend', '后端开发', 'Backend development', 'engineering', true),
  ('product-design', '产品设计', 'Product design', 'design', true),
  ('user-research', '用户研究', 'User research', 'product', true),
  ('content-operations', '内容运营', 'Content operations', 'operations', true),
  ('ai-application', 'AI应用开发', 'AI application development', 'engineering', true),
  ('data-analysis', '数据分析', 'Data analysis', 'data', true),
  ('computer-vision', '计算机视觉', 'Computer vision', 'engineering', true),
  ('rehabilitation', '康复治疗', 'Rehabilitation', 'health', true),
  ('community-operations', '社群运营', 'Community operations', 'operations', true)
on conflict (slug) do update
set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  category = excluded.category,
  is_active = excluded.is_active,
  updated_at = now();
