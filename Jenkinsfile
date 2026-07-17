pipeline {

    agent any

    environment {
        IMAGE_NAME = "inventory-management"
        CONTAINER_NAME = "inventory-app"
        PORT = "5000"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out source code..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Verify Docker Image') {
            steps {
                echo "Verifying Docker image..."
                sh "docker images"
            }
        }

        stage('Stop Old Container') {
            steps {
                echo "Stopping old container..."
                sh "docker stop ${CONTAINER_NAME} || true"
            }
        }

        stage('Remove Old Container') {
            steps {
                echo "Removing old container..."
                sh "docker rm ${CONTAINER_NAME} || true"
            }
        }

      stage('Run New Container') {
    steps {
        sh """
        docker run -d \
          --name inventory-app \
          --network inventory-network \
          -p 5000:5000 \
          -e DATABASE_URL="postgresql://postgres:Proc%4012345@host.docker.internal:5432/inventory" \
          inventory-management:latest
        """
    }
}

        stage('Verify Deployment') {
            steps {
                echo "Checking running containers..."
                sh "docker ps"
            }
        }
    }

    post {
        success {
            echo "🎉 CI/CD Pipeline Completed Successfully!"
        }

        failure {
            echo "❌ CI/CD Pipeline Failed!"
        }
    }
}