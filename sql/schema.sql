PRAGMA foreign_keys = ON;

-- Campaigns

CREATE TABLE campaigns (
  campaign_id INTEGER PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  channel_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget REAL CHECK (budget >= 0),
  created_at TEXT NOT NULL,
  modified_at TEXT
);

-- Customers

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  modified_at TEXT
);


-- Engagements (event-level)

CREATE TABLE engagements (
  engagement_id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  channel_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  action_type TEXT CHECK (action_type IN ('open','click')),
  action_time TEXT NOT NULL,
  created_at TEXT NOT NULL,
  modified_at TEXT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);


-- Purchases (conversions)

CREATE TABLE purchases (
  purchase_id INTEGER PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  amount REAL CHECK (amount >= 0),
  purchase_time TEXT NOT NULL,
  created_at TEXT NOT NULL,
  modified_at TEXT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);


-- Performance Indexes

CREATE INDEX idx_eng_campaign ON engagements(campaign_id);
CREATE INDEX idx_eng_channel ON engagements(channel_id);
CREATE INDEX idx_eng_time ON engagements(action_time);

CREATE INDEX idx_purchase_campaign ON purchases(campaign_id);
CREATE INDEX idx_purchase_time ON purchases(purchase_time);



