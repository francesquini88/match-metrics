resource "aws_instance" "app" {
  ami           = "Ubuntu 22.04 us-east-1"
  instance_type = "t2.micro"

  tags = {
    Name = "ChallengeApp"
  }
}
