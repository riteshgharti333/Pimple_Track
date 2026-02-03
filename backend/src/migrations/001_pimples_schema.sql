-- ENUMS
CREATE TYPE pimple_location AS ENUM (
  'chin',
  'nose',
  'left cheek',
  'right cheek',
  'forehead'
);

CREATE TYPE pimple_type AS ENUM (
  'pih',
  'pie'
);

CREATE TYPE pimple_color AS ENUM (
  'red',
  'pink',
  'brown',
  'tan',
  'gray',
  'black'
);

CREATE TYPE pimple_size AS ENUM (
  'small',
  'medium',
  'big'
);

CREATE TYPE pimple_status AS ENUM (
  'active',
  'healing',
  'flattening',
  'gone'
);

CREATE TYPE pimple_pain AS ENUM (
  'high',
  'little',
  'none'
);

-- TABLE
CREATE TABLE pimples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  location pimple_location NOT NULL,
  type pimple_type,
  color pimple_color,
  size pimple_size NOT NULL,
  status pimple_status NOT NULL,
  pain pimple_pain,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
