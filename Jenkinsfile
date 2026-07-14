pipeline {

    agent any

    environment {
        IMAGE_NAME = "inventory-management"
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
                echo "Building Docker Image..."
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Verify Docker Image') {
            steps {
                echo "Listing Docker Images..."
                sh "docker images"
            }
        }

    }

    post {

        success {
            echo "CI Pipeline Completed Successfully!"
        }

        failure {
            echo "CI Pipeline Failed!"
        }

    }

}