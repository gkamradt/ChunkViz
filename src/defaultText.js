/**
 * Default text samples for each language/splitter type
 */

export const defaultTexts = {
  prose: `One of the most important things I didn't understand about the world when I was a child is the degree to which the returns for performance are superlinear.

Teachers and coaches implicitly told us the returns were linear. "You get out," I heard a thousand times, "what you put in." They meant well, but this is rarely true. If your product is only half as good as your competitor's, you don't get half as many customers. You get no customers, and you go out of business.

It's obviously true that the returns for performance are superlinear in business. Some think this is a flaw of capitalism, and that if we changed the rules it would stop being true. But superlinear returns for performance are a feature of the world, not an artifact of rules we've invented. We see the same pattern in fame, power, military victories, knowledge, and even benefit to humanity. In all of these, the rich get richer.

You can't understand the world without understanding the concept of superlinear returns. And if you're ambitious you definitely should, because this will be the wave you surf on.

It may seem as if there are a lot of different situations with superlinear returns, but as far as I can tell they reduce to two fundamental causes: exponential growth and thresholds.

The most obvious case of superlinear returns is when you're working on something that grows exponentially. For example, growing bacterial cultures. When they grow at all, they grow exponentially. But they're tricky to grow. Which means the difference in outcome between someone who's adept at it and someone who's not is very great.

Startups can also grow exponentially, and we see the same pattern there. Some manage to achieve high growth rates. Most don't. And as a result you get qualitatively different outcomes: the companies with high growth rates tend to become immensely valuable, while the ones with lower growth rates may not even survive.

Y Combinator encourages founders to focus on growth rate rather than absolute numbers. It prevents them from being discouraged early on, when the absolute numbers are still low. It also helps them decide what to focus on: you can use growth rate as a compass to tell you how to evolve the company. But the main advantage is that by focusing on growth rate you tend to get something that grows exponentially.

YC doesn't explicitly tell founders that with growth rate "you get out what you put in," but it's not far from the truth. And if growth rate were proportional to performance, then the reward for performance p over time t would be proportional to pt.

Even after decades of thinking about this, I find that sentence startling.`,

  javascript: `import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const text = "Some other considerations include:

- Do you deploy your backend and frontend together, or separately?
- Do you deploy your backend co-located with your database, or separately?

**Production Support:** As you move your LangChains into production, we'd love to offer more hands-on support.
Fill out [this form](https://airtable.com/appwQzlErAS2qiP0L/shrGtGaVBVAz7NcV2) to share more about what you're building, and our team will get in touch.

## Deployment Options

See below for a list of deployment options for your LangChain app. If you don't see your preferred option, please get in touch and we can add it to this list.";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 1,
  separators: ["|", "##", ">", "-"],
});

const docOutput = await splitter.splitDocuments([
  new Document({ pageContent: text }),
]);

console.log(docOutput);`,

  python: `from operator import itemgetter

from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableLambda, RunnablePassthrough
from langchain.vectorstores import FAISS

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)`,

  markdown: `# Needle In A Haystack - Pressure Testing LLMs

Supported model providers: OpenAI, Anthropic

A simple 'needle in a haystack' analysis to test in-context retrieval ability of long context LLMs.

Get the behind the scenes on the [overview video](https://youtu.be/KwRRuiCCdmc).

![GPT-4-128 Context Testing](img/NeedleHaystackCodeSnippet.png)

git clone https://github.com/gkamradt/LLMTest_NeedleInAHaystack.git

## The Test
1. Place a random fact or statement (the 'needle') in the middle of a long context window (the 'haystack')
2. Ask the model to retrieve this statement
3. Iterate over various document depths (where the needle is placed) and context lengths to measure performance

## Results

The results show that most models struggle with retrieval at certain context lengths and depths.

### Key Findings

- GPT-4-128k performs well at shorter contexts but degrades at longer ones
- Claude models show more consistent performance across context lengths
- Position of the needle significantly affects retrieval accuracy`,

  go: `package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

type Server struct {
    httpServer *http.Server
    logger     *log.Logger
}

func NewServer(addr string) *Server {
    logger := log.New(os.Stdout, "[server] ", log.LstdFlags)

    mux := http.NewServeMux()
    mux.HandleFunc("/health", healthHandler)
    mux.HandleFunc("/api/v1/users", usersHandler)

    return &Server{
        httpServer: &http.Server{
            Addr:         addr,
            Handler:      mux,
            ReadTimeout:  15 * time.Second,
            WriteTimeout: 15 * time.Second,
        },
        logger: logger,
    }
}

func (s *Server) Start() error {
    s.logger.Printf("Starting server on %s", s.httpServer.Addr)
    return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
    s.logger.Println("Shutting down server...")
    return s.httpServer.Shutdown(ctx)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, "OK")
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        fmt.Fprintf(w, "List users")
    case http.MethodPost:
        fmt.Fprintf(w, "Create user")
    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func main() {
    server := NewServer(":8080")

    go func() {
        if err := server.Start(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }
}`,

  rust: `use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

#[derive(Debug, Clone)]
pub struct Message {
    id: u64,
    content: String,
    timestamp: chrono::DateTime<chrono::Utc>,
}

impl Message {
    pub fn new(id: u64, content: String) -> Self {
        Self {
            id,
            content,
            timestamp: chrono::Utc::now(),
        }
    }
}

#[derive(Debug)]
pub struct MessageQueue {
    messages: Arc<Mutex<HashMap<u64, Message>>>,
    sender: mpsc::Sender<Message>,
    receiver: mpsc::Receiver<Message>,
}

impl MessageQueue {
    pub fn new(buffer_size: usize) -> Self {
        let (sender, receiver) = mpsc::channel(buffer_size);
        Self {
            messages: Arc::new(Mutex::new(HashMap::new())),
            sender,
            receiver,
        }
    }

    pub async fn send(&self, message: Message) -> Result<(), mpsc::error::SendError<Message>> {
        let id = message.id;
        self.sender.send(message.clone()).await?;

        let mut messages = self.messages.lock().unwrap();
        messages.insert(id, message);

        Ok(())
    }

    pub async fn receive(&mut self) -> Option<Message> {
        self.receiver.recv().await
    }

    pub fn get(&self, id: u64) -> Option<Message> {
        let messages = self.messages.lock().unwrap();
        messages.get(&id).cloned()
    }
}

#[tokio::main]
async fn main() {
    let mut queue = MessageQueue::new(100);

    let msg = Message::new(1, "Hello, World!".to_string());
    queue.send(msg).await.expect("Failed to send message");

    if let Some(received) = queue.receive().await {
        println!("Received: {:?}", received);
    }
}`,

  java: `package com.example.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class UserService {

    private final ConcurrentHashMap<Long, User> users;
    private final EmailService emailService;
    private final Logger logger;

    public UserService(EmailService emailService, Logger logger) {
        this.users = new ConcurrentHashMap<>();
        this.emailService = emailService;
        this.logger = logger;
    }

    public User createUser(String name, String email) {
        long id = System.currentTimeMillis();
        User user = new User(id, name, email);
        users.put(id, user);

        logger.info("Created user: " + user.getName());
        emailService.sendWelcomeEmail(user);

        return user;
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    public List<User> findByEmailDomain(String domain) {
        return users.values().stream()
            .filter(user -> user.getEmail().endsWith("@" + domain))
            .collect(Collectors.toList());
    }

    public void updateUser(Long id, String name, String email) {
        users.computeIfPresent(id, (key, user) -> {
            user.setName(name);
            user.setEmail(email);
            return user;
        });
    }

    public boolean deleteUser(Long id) {
        User removed = users.remove(id);
        if (removed != null) {
            logger.info("Deleted user: " + removed.getName());
            return true;
        }
        return false;
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
}

class User {
    private final Long id;
    private String name;
    private String email;

    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
}`,

  cpp: `#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>
#include <functional>

template<typename T>
class Observable {
public:
    using Observer = std::function<void(const T&)>;

    void subscribe(Observer observer) {
        observers_.push_back(observer);
    }

    void notify(const T& value) {
        for (const auto& observer : observers_) {
            observer(value);
        }
    }

private:
    std::vector<Observer> observers_;
};

class DataProcessor {
public:
    struct ProcessedData {
        int id;
        std::string result;
        double score;
    };

    DataProcessor() : observable_(std::make_unique<Observable<ProcessedData>>()) {}

    void process(const std::vector<int>& input) {
        for (int value : input) {
            ProcessedData data{
                value,
                "Processed: " + std::to_string(value),
                calculateScore(value)
            };
            observable_->notify(data);
        }
    }

    void onProcessed(Observable<ProcessedData>::Observer observer) {
        observable_->subscribe(observer);
    }

private:
    double calculateScore(int value) {
        return static_cast<double>(value) / 100.0;
    }

    std::unique_ptr<Observable<ProcessedData>> observable_;
};

int main() {
    DataProcessor processor;

    processor.onProcessed([](const DataProcessor::ProcessedData& data) {
        std::cout << "ID: " << data.id
                  << ", Result: " << data.result
                  << ", Score: " << data.score << std::endl;
    });

    std::vector<int> input{1, 2, 3, 4, 5};
    processor.process(input);

    return 0;
}`,

  php: `<?php

namespace App\\Services;

use App\\Models\\User;
use App\\Repositories\\UserRepository;
use App\\Events\\UserCreated;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\Log;

class UserService
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function createUser(array $data): User
    {
        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $this->userRepository->save($user);

        Log::info('User created', ['user_id' => $user->id]);
        event(new UserCreated($user));

        return $user;
    }

    public function findById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    public function updateUser(int $id, array $data): bool
    {
        $user = $this->findById($id);

        if (!$user) {
            return false;
        }

        $user->fill($data);
        return $this->userRepository->save($user);
    }

    public function deleteUser(int $id): bool
    {
        $user = $this->findById($id);

        if (!$user) {
            return false;
        }

        Log::info('User deleted', ['user_id' => $id]);
        return $this->userRepository->delete($user);
    }

    public function getAllUsers(): array
    {
        return $this->userRepository->all();
    }

    public function searchByEmail(string $email): array
    {
        return $this->userRepository->findByEmail($email);
    }
}`,

  ruby: `module Services
  class UserService
    attr_reader :repository, :mailer, :logger

    def initialize(repository:, mailer:, logger: Rails.logger)
      @repository = repository
      @mailer = mailer
      @logger = logger
    end

    def create_user(params)
      user = User.new(
        name: params[:name],
        email: params[:email],
        password_digest: BCrypt::Password.create(params[:password])
      )

      repository.save(user)
      logger.info "User created: #{user.id}"
      mailer.send_welcome_email(user)

      user
    rescue StandardError => e
      logger.error "Failed to create user: #{e.message}"
      raise
    end

    def find_by_id(id)
      repository.find(id)
    end

    def update_user(id, params)
      user = find_by_id(id)
      return nil unless user

      user.assign_attributes(params.slice(:name, :email))
      repository.save(user)

      user
    end

    def delete_user(id)
      user = find_by_id(id)
      return false unless user

      repository.delete(user)
      logger.info "User deleted: #{id}"

      true
    end

    def search_users(query)
      repository.search(query)
    end

    def users_by_domain(domain)
      repository.all.select do |user|
        user.email.end_with?("@#{domain}")
      end
    end
  end
end

class User
  attr_accessor :id, :name, :email, :password_digest, :created_at

  def initialize(attributes = {})
    attributes.each do |key, value|
      send("#{key}=", value) if respond_to?("#{key}=")
    end
    @created_at ||= Time.now
  end
end`,

  scala: `package com.example.service

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

case class User(id: Long, name: String, email: String)

trait UserRepository {
  def find(id: Long): Future[Option[User]]
  def save(user: User): Future[User]
  def delete(id: Long): Future[Boolean]
  def findAll(): Future[Seq[User]]
}

class UserService(
  repository: UserRepository,
  emailService: EmailService
)(implicit ec: ExecutionContext) {

  def createUser(name: String, email: String): Future[User] = {
    val user = User(
      id = System.currentTimeMillis(),
      name = name,
      email = email
    )

    for {
      savedUser <- repository.save(user)
      _ <- emailService.sendWelcomeEmail(savedUser)
    } yield savedUser
  }

  def findById(id: Long): Future[Option[User]] = {
    repository.find(id)
  }

  def updateUser(id: Long, name: String, email: String): Future[Option[User]] = {
    repository.find(id).flatMap {
      case Some(user) =>
        val updated = user.copy(name = name, email = email)
        repository.save(updated).map(Some(_))
      case None =>
        Future.successful(None)
    }
  }

  def deleteUser(id: Long): Future[Boolean] = {
    repository.delete(id)
  }

  def getUsersByDomain(domain: String): Future[Seq[User]] = {
    repository.findAll().map { users =>
      users.filter(_.email.endsWith(s"@$domain"))
    }
  }

  def processUsers(f: User => Unit): Future[Unit] = {
    repository.findAll().map { users =>
      users.foreach(f)
    }
  }
}

trait EmailService {
  def sendWelcomeEmail(user: User): Future[Unit]
}`,

  swift: `import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    var name: String
    var email: String
    let createdAt: Date

    init(name: String, email: String) {
        self.id = UUID()
        self.name = name
        self.email = email
        self.createdAt = Date()
    }
}

protocol UserRepositoryProtocol {
    func find(id: UUID) async throws -> User?
    func save(_ user: User) async throws -> User
    func delete(id: UUID) async throws -> Bool
    func findAll() async throws -> [User]
}

actor UserService {
    private let repository: UserRepositoryProtocol
    private let emailService: EmailService

    init(repository: UserRepositoryProtocol, emailService: EmailService) {
        self.repository = repository
        self.emailService = emailService
    }

    func createUser(name: String, email: String) async throws -> User {
        let user = User(name: name, email: email)
        let savedUser = try await repository.save(user)

        Task {
            try? await emailService.sendWelcomeEmail(to: savedUser)
        }

        return savedUser
    }

    func findById(_ id: UUID) async throws -> User? {
        try await repository.find(id: id)
    }

    func updateUser(id: UUID, name: String, email: String) async throws -> User? {
        guard var user = try await repository.find(id: id) else {
            return nil
        }

        user.name = name
        user.email = email

        return try await repository.save(user)
    }

    func deleteUser(id: UUID) async throws -> Bool {
        try await repository.delete(id: id)
    }

    func getUsersByDomain(_ domain: String) async throws -> [User] {
        let users = try await repository.findAll()
        return users.filter { $0.email.hasSuffix("@\\(domain)") }
    }
}

protocol EmailService {
    func sendWelcomeEmail(to user: User) async throws
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="main-header">
        <nav class="navbar">
            <div class="logo">
                <a href="/">Dashboard</a>
            </div>
            <ul class="nav-links">
                <li><a href="/home">Home</a></li>
                <li><a href="/users">Users</a></li>
                <li><a href="/settings">Settings</a></li>
            </ul>
        </nav>
    </header>

    <main class="container">
        <section class="user-profile">
            <h1>User Profile</h1>
            <div class="profile-card">
                <img src="avatar.png" alt="User avatar" class="avatar">
                <div class="user-info">
                    <h2>John Doe</h2>
                    <p class="email">john.doe@example.com</p>
                    <p class="role">Administrator</p>
                </div>
            </div>
        </section>

        <section class="activity-feed">
            <h2>Recent Activity</h2>
            <ul class="activity-list">
                <li class="activity-item">
                    <span class="activity-icon">📝</span>
                    <span class="activity-text">Updated profile settings</span>
                    <time datetime="2024-01-15">Jan 15, 2024</time>
                </li>
                <li class="activity-item">
                    <span class="activity-icon">🔐</span>
                    <span class="activity-text">Changed password</span>
                    <time datetime="2024-01-14">Jan 14, 2024</time>
                </li>
            </ul>
        </section>
    </main>

    <footer class="main-footer">
        <p>&copy; 2024 Dashboard App. All rights reserved.</p>
    </footer>

    <script src="app.js"></script>
</body>
</html>`,

  latex: `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Introduction to Machine Learning}
\\author{John Doe}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This paper provides an introduction to fundamental concepts in machine learning,
including supervised and unsupervised learning, neural networks, and optimization techniques.
\\end{abstract}

\\section{Introduction}

Machine learning is a subset of artificial intelligence that enables systems to learn
and improve from experience without being explicitly programmed.

\\subsection{Types of Learning}

There are three main types of machine learning:

\\begin{enumerate}
    \\item \\textbf{Supervised Learning}: Learning from labeled examples
    \\item \\textbf{Unsupervised Learning}: Finding patterns in unlabeled data
    \\item \\textbf{Reinforcement Learning}: Learning through trial and error
\\end{enumerate}

\\section{Mathematical Foundations}

\\subsection{Linear Regression}

The linear regression model can be expressed as:

\\begin{equation}
    y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_n x_n + \\epsilon
\\end{equation}

where $\\epsilon$ represents the error term.

\\subsection{Gradient Descent}

The gradient descent update rule is given by:

\\begin{equation}
    \\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)
\\end{equation}

where $\\alpha$ is the learning rate and $\\nabla J(\\theta)$ is the gradient of the cost function.

\\section{Conclusion}

Machine learning continues to advance rapidly, with new techniques and applications emerging regularly.

\\end{document}`
};

// Legacy exports for backwards compatibility
export const defaultProse = defaultTexts.prose;
export const defaultJS = defaultTexts.javascript;
export const defaultPython = defaultTexts.python;
export const defaultMarkdown = defaultTexts.markdown;

// Helper function to get default text for a splitter
export function getDefaultText(key) {
  return defaultTexts[key] || defaultTexts.prose;
}
