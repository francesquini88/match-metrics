output "instance_public_ip" {
  description = "IP público da instância EC2"
  value = aws_instance.app
}
