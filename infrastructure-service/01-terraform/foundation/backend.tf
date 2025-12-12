terraform {
  backend "oci" {
    bucket    = "ecommerce-backend"
    namespace = "bmzcke8ke5xv"
    region    = "ap-mumbai-1"
    key       = "foundation/terraform.tfstate"
  }
}