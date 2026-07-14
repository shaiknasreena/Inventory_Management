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

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test -- --watchAll=false'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh 'docker images'
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline Completed Successfully!'
        }
        failure {
            echo 'CI Pipeline Failed!'
        }
    }
}