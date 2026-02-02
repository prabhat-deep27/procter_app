pipeline {
    agent any

    tools {
        // These names MUST match the 'Name' fields in Jenkins Tools
        maven 'Maven4' 
        jdk 'jdk21'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building with Maven 4 and JDK 21...'
                sh 'mvn -f server/pom.xml clean install -DskipTests'
            }
        }
    }
}
