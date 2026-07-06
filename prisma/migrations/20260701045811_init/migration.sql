-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "customer_name" TEXT NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);
