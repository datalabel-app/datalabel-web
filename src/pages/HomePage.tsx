import { Layout, Row, Col, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  return (
    <Layout style={{ background: "#fff" }}>
      <Content>
        {/* HERO */}
        <div
          style={{
            padding: "80px 60px",
            background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
            color: "white",
          }}
        >
          <Row align="middle" gutter={40}>
            <Col span={12}>
              <h1 style={{ fontSize: 42, fontWeight: 700 }}>
                DataLabeling Platform
              </h1>
              <p style={{ fontSize: 18, marginTop: 20 }}>
                Build high quality datasets for AI & Machine Learning. Our
                platform helps teams label images, text and video faster with
                powerful tools.
              </p>
              {Number(role) === 2 && (
                <Button
                  type="primary"
                  size="large"
                  style={{ marginTop: 30 }}
                  onClick={() => navigate("/projects")}
                >
                  Start Labeling
                </Button>
              )}
            </Col>

            <Col span={12}>
              <img
                src="https://images.unsplash.com/photo-1555949963-aa79dcee981c"
                alt="ai"
                style={{ width: "100%", borderRadius: 10 }}
              />
            </Col>
          </Row>
        </div>

        {/* ABOUT */}
        <div style={{ padding: "80px 60px" }}>
          <Row gutter={40} align="middle">
            <Col span={12}>
              <img
                src="https://images.unsplash.com/photo-1581091870622-1e7e2b0c6c3d"
                alt="dataset"
                style={{ width: "100%", borderRadius: 10 }}
              />
            </Col>

            <Col span={12}>
              <h2 style={{ fontSize: 32, fontWeight: 700 }}>
                What is Data Labeling?
              </h2>

              <p style={{ fontSize: 16, marginTop: 20 }}>
                Data labeling is the process of tagging raw data such as images,
                text, audio, or video with meaningful labels so machine learning
                models can learn from it.
              </p>

              <p style={{ fontSize: 16 }}>
                High quality labeled datasets are the foundation of successful
                AI systems such as computer vision, NLP, recommendation systems
                and autonomous vehicles.
              </p>
            </Col>
          </Row>
        </div>

        {/* DATASET TYPES */}
        <div
          style={{
            padding: "80px 60px",
            background: "#f5f5f5",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 50,
            }}
          >
            Supported Dataset Types
          </h2>

          <Row gutter={24}>
            <Col span={8}>
              <Card hoverable>
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <h3 style={{ marginTop: 15 }}>Image Labeling</h3>
                <p>
                  Bounding boxes, segmentation and classification for computer
                  vision models.
                </p>
              </Card>
            </Col>

            <Col span={8}>
              <Card hoverable>
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <h3 style={{ marginTop: 15 }}>Text Annotation</h3>
                <p>
                  Label sentiment, entities and categories for NLP training
                  datasets.
                </p>
              </Card>
            </Col>

            <Col span={8}>
              <Card hoverable>
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <h3 style={{ marginTop: 15 }}>Video Annotation</h3>
                <p>
                  Track objects across frames and build datasets for autonomous
                  driving and surveillance.
                </p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* WORKFLOW */}
        <div style={{ padding: "80px 60px" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 60,
            }}
          >
            Labeling Workflow
          </h2>

          <Row gutter={40}>
            <Col span={6}>
              <Card>
                <h3>1. Upload Dataset</h3>
                <p>
                  Upload images, text files or videos to create your dataset.
                </p>
              </Card>
            </Col>

            <Col span={6}>
              <Card>
                <h3>2. Create Tasks</h3>
                <p>
                  Assign labeling tasks to annotators with specific
                  instructions.
                </p>
              </Card>
            </Col>

            <Col span={6}>
              <Card>
                <h3>3. Label Data</h3>
                <p>Annotators label the data using intuitive labeling tools.</p>
              </Card>
            </Col>

            <Col span={6}>
              <Card>
                <h3>4. Export Dataset</h3>
                <p>
                  Download labeled datasets ready for machine learning training.
                </p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA */}
        <div
          style={{
            padding: "80px",
            textAlign: "center",
            background: "#0f172a",
            color: "white",
          }}
        >
          <h2 style={{ fontSize: 34, fontWeight: 700 }}>
            Start Building AI Datasets Today
          </h2>

          <p style={{ marginTop: 20, fontSize: 18 }}>
            Manage projects, tasks and annotations in one platform.
          </p>

          {Number(role) === 2 && (
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 30 }}
              onClick={() => (window.location.href = "/projects")}
            >
              Go To Projects
            </Button>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
