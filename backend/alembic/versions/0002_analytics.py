"""Add site analytics records.

Revision ID: 0002_analytics
Revises: 0001_initial
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_analytics"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analytics_records",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("site_id", sa.String(), nullable=False),
        sa.Column("recorded_date", sa.Date(), nullable=False),
        sa.Column("carbon_tonnes", sa.Float(), nullable=False),
        sa.Column("biodiversity_index", sa.Float(), nullable=False),
        sa.Column("canopy_cover_pct", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["site_id"], ["sites.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("site_id", "recorded_date", name="uq_site_recorded_date"),
    )
    op.create_index("ix_analytics_records_site_id", "analytics_records", ["site_id"], unique=False)
    op.create_index("ix_analytics_records_recorded_date", "analytics_records", ["recorded_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_analytics_records_recorded_date", table_name="analytics_records")
    op.drop_index("ix_analytics_records_site_id", table_name="analytics_records")
    op.drop_table("analytics_records")