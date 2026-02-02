pipeline {
    agent any
    
    tools {
        // This must match the name you gave Maven in 'Manage Jenkins > Tools'
        maven 'Maven3' 
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Java Server...'
                // Use -f to point to the pom file in the server directory
                sh 'mvn -f server/pom.xml clean install -DskipTests' 
            }
        }
        stage('Test') {
            steps {
                echo 'Running Server Tests...'
                sh 'mvn -f server/pom.xml test'
            }
        }
    }
    post {
        success {
            echo 'Server build and tests passed!'
        }
        failure {
            echo 'Build failed. Check the server/ directory or Maven logs.'
        }
    }
}
